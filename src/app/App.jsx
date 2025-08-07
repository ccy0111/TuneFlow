// npm modules
import { useLiveQuery } from "dexie-react-hooks"
import { parseBlob } from "music-metadata"
import { useEffect, useState } from "react"

// local modules and components
import * as DB from "../db"
import { MusicController } from "../music_controller/controller"
import { Sidebar } from "../side/side"

// css
import './App.css'

function App() {

     // 이거 dexie live hook으로 교체할까 고민중
     const [curMusic, setCurMusic] = useState(null)    // 현재 재생중인 음악
     const playlists = useLiveQuery(() => DB.db.playlists.toArray(), [], []);
     
     // 음악 업로드 핸들러
     async function handleUpload(e) {
          
          const files = Array.from(e.target.files).filter((f) =>
               f.type.startsWith("audio/")
          );
          
          const newMusic = await Promise.all(
               files.map(async (f) => {

                    const { common } = await parseBlob(f)
                    const audio = f
                    
                    let cover = null

                    if (common.picture?.length) {
                         const pic = common.picture[0]
                         cover = new Blob([pic.data], { type: pic.format });
                    }
                    
                    const lyrics = common.lyrics?.[0]["text"] ?? null;
                    const title = common.title ?? null;
                    const artist = common.artist ?? null;
                    
                    let parsed_music = { cover, audio, lyrics, title, artist };
                    let id = await DB.addMusic(parsed_music);

                    const music = { id, ...parsed_music }
                    return music
               })
          )
     }
     
     // 현재 재생중인 음악 선택
     async function playNow(id) {
          const music = await DB.db.music.get(id)
          if (id) setCurMusic(music)
     }
     
     useEffect(() => { console.log(playlists)}, [playlists])
     
     // loading guard
     if (!playlists.length)  return (<div> loading...</div>)
     
     return (
          <div>
               <input type="file" accept="audio/*" multiple onChange={handleUpload}></input>
               <button onClick={DB.resetDB}> 리셋버튼 </button>  {/* for debug */}
               <button onClick={() => { console.log(playlists) }}> playlists </button>

               <Sidebar playMusic={playNow} />
               <MusicController music = {curMusic}/>
          </div>
     );
}

export default App
