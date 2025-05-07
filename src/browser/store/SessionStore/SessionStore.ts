import { defineStore } from 'pinia'
import { useTrackStore } from '@/browser/store'
import type { CreateTrackType } from '../TrackStore/TrackStore'

export interface CreateSessionType {
    key: string
    trackIds: Array<string>
    sessionConfig: SessionConfigType
}

export interface SessionConfigType {
    width: number
    height: number
    type: string
    maxTrackNum: number
}

export const createSessionStore = (id: string = 'default') => {
    const storeId = `session-${id}`
    
    return defineStore(storeId, {
        id: storeId,
        state: () => ({
            sessionList: [] as CreateSessionType[],
            targetedSession: [],
            id: id
        }),
        getters: {
            getSessionList() {
                return this.sessionList
            },
            getTargtedSession() {
                return this.sessionList.filter(session => this.targetedSession.includes(session.key));
            }
        },
        actions: {
            getTrackById(id: string): CreateTrackType | undefined {
                const trackStore = useTrackStore()
                // Assuming there is an array of tracks defined somewhere
                return trackStore.getTrackList.find((track) => track.key === id);
            },
            getSessionTracks(session: CreateSessionType): Array<CreateTrackType> {
                const tracks: Array<CreateTrackType> = [];
                // console.log('ssssssss', session )
                if (Array.isArray(session)) {
                    session = session[0]
                }
                for (const trackId of session.trackIds) {
                    // console.log('ppppppp', trackId)
                    const track = this.getTrackById(trackId);
                    if (track) {
                        tracks.push(track);
                    }
                }
                // console.log('lllllllll', tracks)
                return tracks;
            },
            getSessionConfigs(sessionId: string): SessionConfigType {
                const session = this.sessionList.find(session => session.key === sessionId)
                if (session) {
                    return session.sessionConfig
                }
                return {
                    type: '',
                    maxTrackNum: 0
                }
            },
            addSession(session: CreateSessionType) {
                this.sessionList.push(session)
            },
            removeSession(session: CreateSessionType): void {
                const index = this.sessionList.indexOf(session)
                if (index !== -1) {
                    this.sessionList.splice(index, 1)
                }
            },
            addSessionTrack(sessionId, trackId: string) {
                const targetedSession = this.sessionList.find(session => session.key === sessionId)
                targetedSession.trackIds.push(trackId)
            },
            removeSessionTrack(sessionId, trackId: string) {
                const targetedSession = this.sessionList.find(session => session.key === sessionId)
                targetedSession.trackIds = targetedSession.trackIds.filter((id) => id != trackId)
                const trackStore = useTrackStore()
                trackStore.removeTrackList([trackId])
            }
        }
    })
}

export const useSessionStore = (id: string = 'default') => {
    return createSessionStore(id)()
}