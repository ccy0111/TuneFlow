
export function MusicController({ music }) {

     function test() {
          if (music) {
               
               const audioURL = URL.createObjectURL(music['audio'])
               return (
                    <div>
                         <audio src={audioURL} controls autoPlay>
                         </audio>
                    </div>
               );
          }
          return (<div> no music </div>);
     }

     return (
          <div>
               {test()}
          </div>
     )
}