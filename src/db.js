import Dexie from "dexie";

export const db = new Dexie("MusicDB");

// DB 스키마
db.version(1).stores({
     music: "++id, cover, audio, lyrics, artist, title",
     playlists: "++id, name, *musicList"
})

db.open();
db.playlists.get(0).then(exists => {
     if (!exists) return db.playlists.add({ id: 0, name: "전체", musicList: [] });
});

// 음악 추가하기
export async function addMusic(music) {
     return db.transaction('rw', db.music, db.playlists, async () => {
          const id = await db.music.add(music);
          const playlist = await db.playlists.get(0);
          if (!playlist) {
               await db.playlists.add({
                    id: 0,
                    name: "전체",
                    musicList: [id]
               })
          } else {
               const updated = [...playlist.musicList, id];
               await db.playlists.update(0, { musicList: updated });
          }
          return id;

     }).then(id => {
          console.log("transaction committed");
          return id;
     }).catch(err => {
          console.log(err)
     });
}

// 재생목록 만들기
export async function makePlaylist(name) {
     db.transaction('rw', db.playlists, async () => {
          const parsedName = name.trim()
          const exists = await db.playlists.where('name').equals(name).count();

          if (exists) throw new Error("name is already used !")
          await db.playlists.add({ name: parsedName, musicList: [] })
     }).then(() => {
          console.log("transaction committed");
     }).catch(err => {
          console.log(err)
     });
}
     
// 재생목록 id로 부터 전체 music
export async function getMusicsInfo(plID) {
     const pl = await db.playlists.get(plID)
     const ids = pl.musicList

     const ret = await db.music.bulkGet(ids)
     return ret;
}


// 특정 플리에 음악 추가
export async function addMusicToPL(id, plID) {

     db.transaction('rw', db.music, db.playlists, async () => {
          // 음악 존재 유무 확인
          const music = await db.music.get(id);
          
          // music id가 0일 수 있으므로
          if (music === undefined) throw new Error('노래가 없슴');
          
          const pl = await db.playlists.get(plID);
          if (pl.musicList.includes(id)) throw new Error('이미 플리에 있다');

          const newPlaylist = { ...pl.musicList, id }
          db.playlists.update(plID, { musicList: newPlaylist })
     }).then(() => {
          console.log("transaction committed")
     }).catch(err => { console.log(err) })
}

// 특정 플리에서 해당 음악 삭제
export async function deleteMusic(id, plID) {
     db.transaction('rw', db.music, db.playlists, async () => {

          const pl = await db.playlists.get(plID)
          if (!pl) throw new Error('pl가 없음', plID)

          const newPl = pl.musicList.filter(f => { return f !== id })
          await db.playlists.update(plID, { musicList: newPl })  
          
          if (plID == 0) {
               await db.playlists.where("musicList").equals(id).modify(pl => {
                    pl.musicList = pl.musicList.filter(f => { return f !== id })
               })
               await db.music.delete(id)
          }

     }).then(() => {
          console.log("transaction committed")
     }).catch(err => {
          console.log(err)
     });
}




// 쌩 초기화 (삭제 - 재생성)
export async function resetDB() {
     await db.delete();

     await db.open();
     db.playlists.get(0).then(exists => {
          if (!exists) return db.playlists.add({ id: 0, name: "전체", musicList: [] });
     })

     console.log("리셋 완료")
}

