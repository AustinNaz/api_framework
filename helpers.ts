import path from 'path'
import fs from 'fs'
import { Response, NextFunction, Request } from 'express'
import { Options } from 'express-jsdoc-swagger'
import { klona } from 'klona/full'

import { failure } from './utils/responseData'

type LookupTable = [string, number, number][]

export function stripFilePath(filePath: string) {
  if (!filePath.includes('routes')) return ''

  if (filePath === 'routes' || filePath === 'routes/index.ts' || filePath === 'routes/index.js')
    return '/'
  else if (filePath.includes('index'))
    return filePath.slice(filePath.indexOf('/'), filePath.indexOf('/index'))
  else return filePath.slice(filePath.indexOf('/'))
}

export function traverseFolders({ app, folderPath }: Omit<Routes, 'extras'>) {
  const lookupTable: LookupTable = [['init layers', 0, app._router.stack.length - 1]]

  fs.readdirSync(folderPath).map(file => {
    const filePath = path.join(folderPath, file)
    const stat = fs.lstatSync(filePath)

    try {
      if (stat.isDirectory()) {
        const subTables = traverseFolders({ app, folderPath: filePath })
        lookupTable.push(...subTables)
      } else if (file.toLowerCase().indexOf('.js')) {
        if (file !== 'index.ts' && file !== 'index.js') return
        lookupTable.push([filePath, 0, 0])
      }
    } catch (err) {
      console.log(err)
    }
  })
  return lookupTable
}

export async function populateRoutes({
  app,
  extras,
  lookupTable
}: Omit<Routes, 'folderPath'> & { lookupTable: LookupTable }) {
  lookupTable.forEach(async (entry, i) => {
    if (entry[0] === 'init layers') return

    const Routes: { default: ({}: Routes) => void } = await import('./' + entry[0])
    console.log(`Importing file ${++i} of ${lookupTable.length}: ${entry[0]}`)
    const filePositionStart = app._router.stack.length

    Routes.default({ app, folderPath: stripFilePath(entry[0]), extras })

    const filePositionEnd = app._router.stack.length - 1
    entry[1] = filePositionStart
    entry[2] = filePositionEnd
  })
}

// Deprecating this function for the 2 above functions
// Wierd bug in Ubuntu? where in typescript some foldernames dont work
// export async function recursiveRoutes({ app, folderPath, extras }: Routes) {
//   const lookupTable: LookupTable = [['init layers', 0, app._router.stack.length - 1]]

//   const promises = fs.readdirSync(folderPath).map(async file => {
//     const filePath = path.join(folderPath, file)
//     const stat = fs.lstatSync(filePath)

//     try {
//       if (stat.isDirectory()) {
//         const subTables = await recursiveRoutes({ app, folderPath: filePath, extras })
//         lookupTable.push(...subTables)
//       } else if (file.toLowerCase().indexOf('.js')) {
//         if (file !== 'index.ts' && file !== 'index.js') return
//         const Routes: { default: ({}: Routes) => void } = await import('./' + filePath)
//         const filePositionStart = app._router.stack.length

//         Routes.default({ app, folderPath: stripFilePath(folderPath), extras })

//         const filePositionEnd = app._router.stack.length - 1
//         lookupTable.push([filePath, filePositionStart, filePositionEnd])
//       }
//     } catch (err) {
//       console.log(err)
//     }
//   })

//   await Promise.all(promises)
//   return lookupTable
// }

export function injectData(data: any) {
  return (req: any, res: Response, next: NextFunction) => {
    Object.keys(data).map(item => {
      req[item] = data[item]
    })
    next()
  }
}

export const parseReq = (req: Request, res: Response, next: NextFunction) => {
  let body
  if (typeof req.body === 'string') body = JSON.parse(req.body)
  else next()

  if (!body) failure({ res, next, body: 'No body was supplied' })
  req.body = body
  next()
}

export const options: Options = {
  info: {
    version: '1.0.0',
    title: 'Express API'
  },
  baseDir: __dirname,
  filesPattern: './routes/**/index.ts',
  exposeSwaggerUI: true,
  apiDocsPath: '/api-docs'
}

export const cleanLookupTable = (lookupTable: LookupTable) => {
  const newTable: LookupTable = [lookupTable[0]]
  lookupTable.forEach(entry => {
    if (!entry.includes('init layers')) newTable.push(entry)
  })

  // Should find a way to combine these sorts together
  newTable.sort((a, b) => {
    if (a[0] === 'init layers') return -1
    else if (b[0] === 'init layers') return 1
    return a[1] - b[1]
  })

  newTable.sort((a, b) => {
    const pathA = a[0].split('/')
    const pathB = b[0].split('/')

    for (let i = 0; i < Math.min(pathA.length, pathB.length); i++) {
      if (pathA[i] !== pathB[i]) {
        if (pathA[i].includes('.') && !pathB[i].includes('.')) {
          return 1 // Move pathA with file below pathB with folder
        } else if (!pathA[i].includes('.') && pathB[i].includes('.')) {
          return -1 // Move pathA with folder above pathB with file
        } else {
          return pathA[i].localeCompare(pathB[i])
        }
      }
    }

    return pathA.length - pathB.length
  })

  return newTable
}

const updateTable = (startIndex: number, increment: number, lookupTable: LookupTable) => {
  for (let i = startIndex; i < lookupTable.length; i++) {
    const tableEntry = lookupTable[i]
    if (i === startIndex) tableEntry[2] = tableEntry[2] + increment
    else {
      tableEntry[1] = tableEntry[1] + increment
      tableEntry[2] = tableEntry[2] + increment
    }
  }
}

export const addRoutes = (
  filePath: string,
  originalStack: any[],
  newStack: any[],
  lookupTable: LookupTable
) => {
  const basePath = filePath.split('/')
  basePath.shift()
  basePath.pop()

  const result: { matches: string[]; depth: number } = { matches: [], depth: 0 }
  lookupTable.forEach(([path], tableIndex) => {
    const indexPath = path.split('/')
    indexPath.shift()
    indexPath.pop()

    basePath.every((folder, index) => {
      let depth = index
      if (folder === indexPath[index]) {
        depth++
        return true
      } else {
        if (result.depth < depth) {
          result.depth = depth
          result.matches = [path]
        } else if (result.depth === depth) {
          result.matches.push(path)
        }
        return false
      }
    })
  })
  // This is kinda a hack, I just want it to be above the base folders index file so it doesnt get overwritten
  // I would like to sort this as if it was a folder structure but no idea how to do that right now.
  result.matches.splice(result.matches.length - 1, 0, filePath)
  console.log({ result })
  const tableIndex = lookupTable.findIndex(entry =>
    entry.includes(result.matches[result.matches.length - 1])
  )
  console.log({ tableIndex })
  const spliceArray = lookupTable[tableIndex]
  console.log({ spliceArray })
  if (!newStack[0].route) newStack.shift()
  console.log({ newStack })

  if (!spliceArray) return console.log('Could not find a spot to splice the new routes in.')

  const startIndex = spliceArray[1]

  originalStack.splice(startIndex, 0, ...klona(newStack))
  // I minus it by the length here since the updateTable function is going to increment it back up when it updates the table
  lookupTable.splice(tableIndex, 0, [filePath, startIndex, startIndex - newStack.length])
  updateTable(tableIndex, newStack.length, lookupTable)

  console.log('updated Table', lookupTable)
  console.log('new stack', originalStack[startIndex])
}

export const updateRoutes = (
  filePath: string,
  originalStack: any[],
  newStack: any[],
  lookupTable: LookupTable
) => {
  const tableIndex = lookupTable.findIndex(entry => entry.includes(filePath))
  const tableEntry = lookupTable[tableIndex]
  console.log({ tableEntry })
  if (!newStack[0].route) newStack.shift()
  const newLength = newStack.length
  // Not sure if I should add it in, hopefully wont be any edge cases
  if (!tableEntry) addRoutes(filePath, originalStack, newStack, lookupTable)
  else {
    const originalLength = tableEntry[2] + 1 - tableEntry[1]
    const diff = newLength - originalLength

    originalStack.splice(tableEntry[1], tableEntry[2] + 1 - tableEntry[1], ...klona(newStack))
    updateTable(tableIndex, diff, lookupTable)
  }
  console.log('new table', lookupTable)
  console.log(`File ${tableEntry[0]} has been reloaded!`)
}

export const deleteRoutes = (filePath: string, originalStack: any[], lookupTable: LookupTable) => {
  const tableIndex = lookupTable.findIndex(entry => entry.includes(filePath))
  const tableEntry = lookupTable[tableIndex]
  console.log({ tableEntry })
  if (!tableEntry) return console.log('Failed to find Route to remove!')

  originalStack.splice(tableEntry[1], tableEntry[2] - tableEntry[1] + 1)
  // Need to update the table before removing the entry otherwise the tableIndex will only have the second index updated and not the first
  updateTable(tableIndex, (tableEntry[2] - tableEntry[1] + 1) * -1, lookupTable)
  lookupTable.splice(tableIndex, 1)
  console.log('updated Table', lookupTable)
}
