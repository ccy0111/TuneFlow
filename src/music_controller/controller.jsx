
export function MusicController({ music }) {

     function test() {
          if (music) {
               
               const srcc = URL.createObjectURL(music['audio'])
               console.log(srcc)
               return (
                    <div>
                         <audio src={srcc} controls>
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