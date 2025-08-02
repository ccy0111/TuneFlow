import { parseBlob } from "music-metadata"
import { useEffect, useState } from "react"
import './App.css'
function App() {
    const [count, setCount] = useState(0)  
  
     // tracks : 전체 음악 목록 
     // 얘도 변경해야 하는게, 재생목록 단위로 저장하는게 좋을 듯
     // {name, [id..]}꼴의 재생 목록 집합을 관리하도록 하기
     // 재생 목록은 localStorage에 저장해두기
     //  가장 큰 트랙 (전체 노래)
     // playlists의 0번은 항상 늘 전체 노래일 것 
     const [playlists, setPlaylists] = useState([])
     // 현재 재생 중인 음악
     const [curMusic, setCurMusic] = useState(null)
     // 현재 재생 목록
     const [curPlaylist, setCurPlaylist] = useState([])

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
                         lyrics: common.lyrics?.[0]["text"] ?? null,
                         title:  common.title       ?? null,
                         artist: common.artist      ?? null
                    };
                    
                    // 0번 재생 목록에 추가하기 (전체 노래에 추가)
                    // playlists[0] = [...playlists[0], { id, cover, audio, meta }]
                         
                    // // local storage에 저장하기
                    // localStorage.setItem("playlistMeta",
                    //      JSON.stringify(list.map(({ id }) => ({ id }))))
                    let coverURL = URL.createObjectURL(cover)
                    console.log({ id, coverURL, audio, meta })
                    return { id, cover, audio, meta };
                    
               })
          )
     }
     useEffect(() => {
          (async () => {
               
               // meta : playlistMeta라는 로컬저장소에서 아이템을 얻어서 파싱한 데이터
               const meta = JSON.parse(localStorage.getItem("playlistMeta") || "[]");

               // Promise로 비동기 처리
               // meta를 매핑해서 indexed DB에서 id를 조회해 blob파일을 얻고 얻고, 해당 데이터의 URL을 받아옴
               const loaded = await Promise.all(
                    meta.map(async (m) => {
                         try {
                              const blob = await idbGet(m.id);
                              if (!blob) return null;
                              return { ...m, url: URL.createObjectURL(blob) };
                         } catch {
                              return null;
                         }
                    })
               );
               
               // 이렇게 받아온 음악 URL을 tracks 변수로 세팅함 
               setPlaylists(loaded.filter(Boolean));
               
               })();
     }, []);
     
     return (
          // for debug
          <input type="file" accept="audio/*" multiple onChange={addMusics}></input>
     )
}

export default App
