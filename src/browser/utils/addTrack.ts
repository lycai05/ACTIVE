// useTrackManager.js
import { ref } from 'vue';
import { useSessionStore } from '@/browser_new/store/SessionStore/SessionStore'
import { useTrackStore } from '@/browser_new/store/TrackStore/TrackStore'

import {colorNameToHex } from './colorNameToHex'



export function useTrackManager(sessionId) {


  const trackStore = useTrackStore();
const sessionStore = useSessionStore();
 
  function sessionExists(sessions, key) {
    return sessions.find(session => session.key === key) !== undefined;
  }

  // check if the session exists, if not, create a new one using the provided name
  let newSession = ref({});
  if (sessionExists(sessionStore.getSessionList, sessionId)) {
    sessionStore.targetedSession.length = 0
    sessionStore.targetedSession.push(sessionId)
    newSession.value = sessionStore.getTargtedSession[0]
    console.log(newSession)
  } else {
    newSession.value = {
      key: sessionId,
      trackIds: [],
      sessionConfig: {
        type: 'TrackList',
        maxTrackNum: 30,
      },
    };
    sessionStore.addSession(newSession.value);
  }


  // provided a list of track information
  let newSessionTracks = []
  const AddTracksToSession = (tracksInfo) => {
    console.log(tracksInfo, sessionId)
    if (tracksInfo.length) {
      const addTrackPromises = tracksInfo.map(trackInfo => createTrack(trackInfo, sessionId));
      Promise.all(addTrackPromises)
        .then(newTracks => {
          newSessionTracks.push(...newTracks);

          for (let i = 0; i < newSessionTracks.length; i++) {
            trackStore.addTrackList(newSessionTracks[i], false, true);
            sessionStore.addSessionTrack(newSession.value.key, newSessionTracks[i].key)
          }

          sessionStore.targetedSession.length = 0
          sessionStore.targetedSession.push(newSession.value.key);
          // newSessionTracks.value = []
          newSessionTracks = []
        })
        .catch(error => {
          console.error(error);
        });
    }

  }


  const configMap = {
    lineWidth: 'series[0].lineStyle.width',
    areaOpacity: 'series[0].areaStyle.opacity',
    lineColor: 'series[0].lineStyle.color', // Added mapping for lineColor
    areaColor: 'series[0].areaStyle.color', // Added mapping for areaColor,
    style: 'style',
    // Pcls track,sclstrack
    anchorColor: 'series[0].itemStyle.color',

    // gene track
    showGeneLabel: 'series[0].label.show',
    geneLabelFill: 'series[0].label.color',
    exonPosStrandFill: 'series[0].itemStyle.positiveStrandColor',
    exonNegStrandFill: 'series[0].itemStyle.negativeStrandColor',
    display: 'series[0].itemStyle.display',

    // network track
    nodeColor:  'series[0].nodeStyle.fill',
    nodeOpacity: 'series[0].nodeStyle.opacity',
    edgeWidth: 'series[0].edgeStyle.width',
    edgeColor: 'series[0].edgeStyle.fill',

    // hic triangle and hic square track
    maxCountColor: 'series[0].itemStyle.maxCountColor',
    dotOpacity: 'series[0].itemStyle.opacity',

   // compartment track
   posColor: 'series[0].itemStyle.posColor',
   negColor: 'series[0].itemStyle.negColor',

   // Stripe track
   stripeFill: 'series[0].itemStyle.stripeFill',
   stripeOpacity: 'series[0].itemStyle.stripeOpacity',

   // Cnv track
   positiveFill: 'series[0].itemStyle.positiveFill',
   negativeFill: 'series[0].itemStyle.negativeFill'
  };

  // Function to apply user config to default config
  function applyUserConfig(defaultConfig, userConfig, configMap) {
    // console.log(arguments)
    const updatedConfig = { ...defaultConfig };

    Object.keys(userConfig).forEach(key => {
      const path = configMap[key];
      // console.log(path)
      if (path) {
        const pathParts = path.split('.');
        let currentPart = updatedConfig;
        // console.log(pathParts)
        while (pathParts.length > 1) {
          const part = pathParts.shift();
          const arrayMatch = part.match(/(.+)\[(\d+)\]/); // Match array index notation
          // console.log(currentPart, arrayMatch)
          if (arrayMatch) {
            currentPart = currentPart[arrayMatch[1]][parseInt(arrayMatch[2], 10)];
          } else {
            currentPart = currentPart[part];
          }
        }

        const finalPart = pathParts[0];
        const finalArrayMatch = finalPart.match(/(.+)\[(\d+)\]/); // Match array index notation

        if (finalArrayMatch) {
          currentPart[finalArrayMatch[1]][parseInt(finalArrayMatch[2], 10)] = userConfig[key];
        } else {
          currentPart[finalPart] = userConfig[key];
        }
      }
    });

    return updatedConfig;
  }


  function removeObjectProperties(obj) {
    // Destructure the object to exclude the specified properties
    const { id, name, label, type, url, ...rest } = obj;
    // Return the new object with the remaining properties
    return rest;
  }
  // create new track component
  const createTrack = async (trackInfo) => {
    // row.loadingStatus = 'loading';
    //    console.log(row)
    const newTrack = await createTrackComponent(trackInfo.type);

    const remainingOptions = removeObjectProperties(trackInfo)

    // change color name to hex symvol
  // Iterate over the keys of the options object
  for (const key in remainingOptions) {
    // Check if the key contains 'color', 'Color', 'fill', or 'Fill'
    if (/color|Color|fill|Fill/.test(key)) {
      // Check if the value is a string and a valid color name
      const value = remainingOptions[key];
      if (typeof value === 'string' && colorNameToHex(value)) {
        // Update the value with its corresponding hex color code
        remainingOptions[key] = colorNameToHex(value);
      }
    }
  }

    // merge user defined and default track options
    newTrack.option = applyUserConfig(newTrack.option, remainingOptions, configMap);
    console.log(newTrack)
    newTrack.key = String(trackInfo.id);
    newTrack.trackConfig.sessionId.push(sessionId);
    newTrack.option.style = trackInfo.style;
    newTrack.trackConfig.name = trackInfo.name;
    newTrack.trackConfig.label = trackInfo.label;
    newTrack.option.url = trackInfo.url;

    // row.loadingStatus = 'loaded';
    // console.log(newTrack)



    return newTrack;

  }
  const modules = import.meta.glob('@/browser/tracks/*/config.ts', { eager: true })
  const modulePaths = Object.keys(modules);

  const createTrackComponent = async (trackType) => {
    try {
      const modulePath = modulePaths.find(path => path.includes(`${trackType}`));
      const moduleImportFunction = await modules[modulePath];
      return new moduleImportFunction.default()
    } catch (error) {
      console.error(`Error while creating component of type ${trackType}: `, error);
      return null;
    }
  }


  return {
    createTrack,
    AddTracksToSession,
    newSession
  }
}