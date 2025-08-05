import { parseBlob } from "music-metadata"
import { useEffect, useState } from "react"
import * as DB from "../db"
import { MusicController } from "../music_controller/controller"
import { Sidebar } from "../side/side"
import './App.css'

function App() {
     const [count, setCount] = useState(0)  
  
     // 재생목록 전체를 관리하는 변수
     const [playlists, setPlaylists] = useState([])
     
     // 현재 재생 중인 음악
     const [curMusic, setCurMusic] = useState(null)
     
     // 현재 재생 목록 (최초 웹 실행 시는 null)
     const [curPlaylist, setCurPlaylist] = useState([])

     async function handleUpload(e) {
          
          const files = Array.from(e.target.files).filter((f) =>
              f.type.startsWith("audio/")
          );
          
          const newMusic = await Promise.all(
               files.map(async (f) => {

                    const {common} = await parseBlob(f)
                    const audio = f
                    
                    let cover = null

                    if (common.picture?.length) {
                         const pic = common.picture[0]
                         cover = new Blob([pic.data], { type: pic.format }); 
                    }
                    
                    const lyrics  =  common.lyrics?.[0]["text"]  ?? null;
                    const title   =  common.title                ?? null;
                    const artist  =  common.artist               ?? null;
                    
                    
                    let parsed_music = { cover, audio, lyrics, title, artist };
                    
                    let id = await DB.saveMusic(parsed_music);

                    const music = { id, ...parsed_music }
                    return music
               })
          )
          
          // state 변수 업데이트 하기 
          let cur_lists = { ...playlists } 
          cur_lists[0] = { ...cur_lists[0], ...newMusic }
          setPlaylists(cur_lists)
     }

     // 음악 선택 and 재생
     async function playMusic(id) {
          const music = await DB.get_music(id)
          setCurMusic(music)
     }
     
     // 시작할 떄 음악 받아오기
     useEffect(() => {
          (async () => {
               const arr = await DB.get_playlists();   // Promise → 배열
               setPlaylists(arr ?? []);
          })();
     }, [])
          
     return (
          // for debug
          <div>
               <input type="file" accept="audio/*" multiple onChange={handleUpload}></input>
               <button onClick={DB.resetDB}> 리셋버튼 </button>
               <button onClick={()=> {console.log(playlists)}}> playlists </button>
               <Sidebar playlists={playlists} playMusic={playMusic} />
               <MusicController music = {curMusic}/>
          </div>
     );
}

export default App
