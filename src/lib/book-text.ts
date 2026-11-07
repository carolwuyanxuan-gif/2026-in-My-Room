/** Keep closing punctuation attached to the preceding character when wrapping. */
export function wrapBookText(text:string,measure:(text:string)=>number,width:number):string[]{
 const closing=/^[，。！？；：、,.!?;:…—）)】\]》〉」』”’％%]$/;
 const opening=/^[（(【\[《〈「『“‘]$/;
 const units:string[]=[];let prefix='';
 for(const char of Array.from(text)){
  if(opening.test(char)){prefix+=char;continue}
  if(closing.test(char)&&units.length&&!prefix)units[units.length-1]+=char;
  else{units.push(prefix+char);prefix=''}
 }
 if(prefix)units.push(prefix);
 const lines:string[]=[];let line='';
 for(const unit of units){if(line&&measure(line+unit)>width){lines.push(line);line=''}line+=unit}
 if(line)lines.push(line);
 return lines;
}
