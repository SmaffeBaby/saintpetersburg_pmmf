import type { DatabaseSync } from 'node:sqlite'
import { openDatabase } from '../database/database'

let database: DatabaseSync | undefined
export const getDatabase = () => database ||= openDatabase(useRuntimeConfig().databasePath)
