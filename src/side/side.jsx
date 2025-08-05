import { useEffect, useState } from "react";
import * as DB from "../db.js";

export function Sidebar({playlists, playMusic}) {    

     
     const [isLists,          setIsLists]         = useState(true);
     const [curPlaylistID,    setCurPlaylistID]   = useState([]);     // 현재 클릭한 플레이 리스트 ID
     const [curPlaylist,      setCurPlaylist]     = useState([]);     // 현재 클릭한 플레이 리스트 

     
     useEffect(() => {
          if (!isLists && curPlaylistID != null) {
               (async () => {
                    try {
                         const arr = await DB.get_playlist(curPlaylistID);
                         setCurPlaylist(arr ?? []);
                    } catch (e) {
                         console.error(e);
                         setCurPlaylist([]);
                    }
               })();
          }
     }, [isLists, curPlaylistID]);
     
     
     if (!playlists.length)   return ( <div> 음악이 없습니다. </div> )

     const gridAllPlayLists = () =>
          playlists.map((pl) => {
               return (
                    // 버튼 혹은 onClick 요소 넣어서 클릭 시 해당 리스트로 이동 기능 만들기 
                    <div key={pl['id']} onClick={() => { setIsLists(false); setCurPlaylistID(pl['id']) }} style={{ cursor: "pointer" }}>
                         {pl['name']}
                    </div>
               );
          });
     
     
     const gridPlayList = () => 
          curPlaylist.map((music) => {
               return (
                    <div key={music['id']} onClick={() => { playMusic(music['id']); }} style={{ cursor: "pointer" }}>
                         {music["title"]}
                    </div>
               )
          });
     
     return ( <div> { isLists ? gridAllPlayLists() : gridPlayList()} </div> )
};
