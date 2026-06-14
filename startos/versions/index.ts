import { VersionGraph } from '@start9labs/start-sdk'
import { current } from './current'
import { v1_2_2_0 } from './v1_2_2_0'

export const versionGraph = VersionGraph.of({
  current,
  other: [v1_2_2_0],
})
