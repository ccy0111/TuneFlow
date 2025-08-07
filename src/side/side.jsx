import { useLiveQuery } from "dexie-react-hooks";
import { useState } from "react";
import * as DB from "../db.js";

// 원칙
// 재생목록 삭제, 이름 변경, 재생목록 추가는 재생목록 리스트 페이지에서
// 음악 삭제, 추가는 재생목록 페이지에서

function GridPlaylist(props) {
     
     const musicList = useLiveQuery(
          async () => {
               const pl = await DB.db.playlists.get(props.PlId)
               if (!pl) return []
               
               const musics = await DB.db.music.bulkGet(pl['musicList'])
               return musics
          }, [props.PlId], [])
     
     
     // loading guard
     if (!musicList) return <div>loading ... </div>
     if (!musicList.length) return (<div>no music</div>)
     
     // 옆에 ... 드롭다운 만들고
     // 클릭시 플리에서 삭제, 다음에 재생, 맨 마지막에 재생, 플리에 추가 기능 추가하기
     return (
          <div>
               <button onClick={() => props.goToLists() }> 뒤로 가기 </button>
               <button style={{ display: props.PlId ? "block" : "none" }}> + </button>
               
               {musicList.map((music) => {
                    return (
                         <div key={music['id']}>
                              <div onClick={() => { props.playMusic(music['id']); }} style={{ cursor: "pointer" }}>
                                   { music["title"]} - { music["artist"]}
                              </div>
                              <button onClick={() => { DB.deleteMusic(music['id'], props.PlId)}}>삭제</button>
                         </div>
                    )
               })}
          </div>
     )
}

// ... 클릭 후 재생목록 삭제, 재생목록 이름 변경 기능 추가하기
function GridPlaylists() {
     const playlists = useLiveQuery(() => DB.db.playlists.toArray(), [], []);
     return 
}

export function Sidebar({playMusic}) {    
     
     const [isLists,          setIsLists]         = useState(true);   // 현재 리스트들 렌더링 ?
     const [curPlId,    setCurPlId]   = useState(0);     // 현재 클릭한 플레이 리스트 ID     
     const playlists = useLiveQuery(() => DB.db.playlists.toArray(), [], []);

     const goToLists = () => setIsLists(true) 
          
     

     const gridAllPlayLists = () =>
          playlists.map((pl) => {
               return (
                    // 버튼 혹은 onClick 요소 넣어서 클릭 시 해당 리스트로 이동 기능 만들기 
                    <div key={pl['id']} onClick={() => { setIsLists(false); setCurPlId(pl['id']) }} style={{ cursor: "pointer" }}>
                         {pl['name']}
                    </div>
               );
          });
     if (!playlists.length)   return (<div> loading </div>)

     return (
          <div>
               {isLists ? gridAllPlayLists() : <GridPlaylist {...{ PlId: curPlId, playMusic, goToLists }} />}
               {/* isLists ? 재생목록 추가 버튼 만들기 시발 존나 귀찮네 */}
          </div>
     )
};