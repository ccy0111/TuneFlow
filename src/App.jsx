import { parseBlob } from "music-metadata"
import 'node-id3'
import { useState } from 'react'
import './App.css'
function App() {

  const [count, setCount] = useState(0)  
  
  // tracks : 전체 음악 목록 
  const [tracks, setTrack] = useState([])
  // 현재 재생 중인 음악
  const [curMusic, setCurMusic] = useState(null)
  // 현재 재생 목록
  const [curTrack, setCurTrack] = useState([])

  // 원래 구조 { id, 음악 파일 }
  // 음악 파일 구조 : { id , cover (blob | null) , audio(blob), metaJSON (가사, 제목, 아티스트) }
  // 사용자로부터 음악 파일들을 입력받고, 파싱해서 indexed DB에 위의 구조로 저장하기

  async function addMusics(e) {
    
    const files = Array.from(e.target.files).filter((f) =>
      f.type.startsWith("audio/")
    );
    
    const newMusic = await Promise.all(
      files.map(async (f) => {

        const {common} = await parseBlob(f)

        const id = Date.now()
        const audio = f.slice()
        
        let cover

        if (common.picture?.length) {
          const pic = common.picture[0]
          cover = new Blob([pic.data], { type: pic.format }); 
        }

        const meta = {
          lyrics: common.lyrics?.[0] ?? null,
          title:  common.title       ?? null,
          artist: common.artist      ?? null
        };
        // 여기서 냅다 idbset({id, cover, audio, meta})
        return { id, cover, audio, meta };
      })
    )
  }
  
  
  return (    
    <div>
      hello, world !

    </div>
  )
}

export default App
