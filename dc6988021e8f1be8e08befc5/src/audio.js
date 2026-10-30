// Original synthesized sounds and melody. No upstream audio recordings are used.
export class Sound {
 constructor(){this.enabled=true;this.ctx=null;this.beat=0;this.next=0;}
 async unlock(){if(!this.ctx)this.ctx=new AudioContext();await this.ctx.resume();}
 tone(freq,duration,type='square',level=.035,slide=1){if(!this.ctx||!this.enabled)return;const o=this.ctx.createOscillator(),g=this.ctx.createGain(),t=this.ctx.currentTime;o.type=type;o.frequency.setValueAtTime(freq,t);o.frequency.exponentialRampToValueAtTime(Math.max(25,freq*slide),t+duration);g.gain.setValueAtTime(level,t);g.gain.exponentialRampToValueAtTime(.0001,t+duration);o.connect(g).connect(this.ctx.destination);o.start(t);o.stop(t+duration);}
 event(name){if(name==='hit'){this.tone(140,.10,'sawtooth',.07,.25);this.tone(840,.045,'triangle',.035,.4);}if(name==='swing')this.tone(180,.07,'triangle',.035,2.4);if(name==='jump')this.tone(210,.12,'square',.02,2);if(name==='slam')this.tone(85,.35,'sawtooth',.08,.3);if(name==='won')for(let i=0;i<3;i++)setTimeout(()=>this.tone([330,440,660][i],.3,'triangle',.07),i*140);}
 update(active){if(!this.ctx||!this.enabled||!active)return;const t=this.ctx.currentTime;if(t<this.next)return;this.next=t+.23;const notes=[110,110,146.83,110,130.81,110,164.81,146.83,98,98,130.81,98,146.83,130.81,110,82.41];this.tone(notes[this.beat%16],.18,'triangle',.065);if(this.beat%2===0)this.tone(65,.09,'sine',.065,.45);if(this.beat%4===3)this.tone(notes[(this.beat+3)%16]*4,.13,'square',.012);this.beat++;}
}
