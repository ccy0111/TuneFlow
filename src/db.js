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
// https://dexie.org/docs/Table/Table.bulkAdd()
export async function saveMusics(musics) {
     db.transaction('rw', db.music, db.playlists, async () => {
          const ids = await db.music.bulkAdd(musics, {allKeys: true});
          const playlist = await db.playlists.get(0);

          if (!playlist) {
               await db.playlists.add({
                    id: 0,
                    name: "전체",
                    musicList: ids
               })
          } else {
               const updated = [...playlist.musicList, ...ids];
               await db.playlists.update(0, { musicList: updated });

               console.log("ids : ", ids)
               console.log(playlist.musicList)
               
          }
     }).then(() => {
          console.log("transaction committed");
     }).catch(err => {
          console.log(err)
     });
}

// 쌩 초기화 (삭제 - 재생성)
export async function resetDB() {
     await db.delete();
     await db.open();
     console.log("리셋 완료")
}

// https://dexie.org/docs/Table/Table.where() 음악 찾기 using where()
// 가령 artist가 "newjeans"인 음악을 찾고 싶다 ? db.music.where({artist:"newjeans"}).toArray()