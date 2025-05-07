import themeJson from '../../configurations/components/setting/global.theme.json'

export interface TrackStoreType {
    trackList: Array<CreateTrackType>
}

type ThemeJsonType = typeof themeJson

export interface CreateTrackType {
    key: string
    trackConfig: ConfigType
    option: ThemeJsonType
    controllerConfig: any
}

export interface CreateTrackGroupType extends CreateTrackType {
    groupList: Array<CreateTrackType>
  }