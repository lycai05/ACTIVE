import themeJson from './settings/global.theme.json'

export interface CreateTrackType {
    key: string
    trackConfig: ConfigType
    option: ThemeJsonType
    controllerConfig: any
}

export interface CreateTrackGroupType extends CreateTrackType {
    groupList: Array<CreateTrackType>
  }

// Track configuration
export type trackConfig = {
    key: string
    chartKey: string
    conKey: string
    controllerKey?: string
    name: string
    label: string
    image: string
    sessionId: Array
    url: string
    // order: string
}


type ThemeJsonType = typeof themeJson
// export interface GlobalThemeJsonType extends Partial<ThemeJsonType> {
//     dataset?: any,
//     [T: string]: any
// }