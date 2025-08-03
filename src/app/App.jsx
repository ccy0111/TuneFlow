import { parseBlob } from "music-metadata"
import { useState } from "react"
import * as DB from "../db"
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
                    const audio = f.slice()
                    
                    let cover = null

                    if (common.picture?.length) {
                         const pic = common.picture[0]
                         cover = new Blob([pic.data], { type: pic.format }); 
                    }
                    
                    const lyrics  =  common.lyrics?.[0]["text"]  ?? null;
                    const title   =  common.title                ?? null;
                    const artist  =  common.artist               ?? null;
                    
                    return { cover, audio, lyrics, title, artist };
               })
          )
          
          // db에 추가하기
          DB.saveMusics(newMusic)
          // state 변수 업데이트 하기
     }

     return (
          // for debug
          <div>
               <input type="file" accept="audio/*" multiple onChange={handleUpload}></input>
               <button onClick={DB.resetDB}> 리셋버튼 </button>
          </div>
     );
}

export default App
