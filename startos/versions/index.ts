import { VersionGraph } from '@start9labs/start-sdk'
import { current } from './current'
import { v1_2_2_0 } from './v1_2_2_0'
import { v1_2_2_1 } from './v1_2_2_1'
import { v1_2_2_2 } from './v1_2_2_2'
import { v1_2_2_3 } from './v1_2_2_3'
import { v1_2_2_4 } from './v1_2_2_4'

export const versionGraph = VersionGraph.of({
  current,
  other: [v1_2_2_0, v1_2_2_1, v1_2_2_2, v1_2_2_3, v1_2_2_4],
})
