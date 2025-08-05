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
export async function saveMusic(music) {
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

// 플레이리스트 목록 전체 리턴
export async function get_playlists() {
     return db.playlists.toArray();
}

// 재생목록 id로 부터 전체 music
export async function get_playlist(id) {
     const pl = await db.playlists.get(id)
     const ids = pl.musicList
     const ret = await db.music.bulkGet(ids)
     return ret;
}

export async function get_music(id) {
     const ret = await db.music.get(id)
     return ret;
}

// 전체 재생 목록에서 음악 삭제
export async function delete_music(music_id) {

}

// 쌩 초기화 (삭제 - 재생성)
export async function resetDB() {
     await db.delete();
     await db.open();
     console.log("리셋 완료")
}

