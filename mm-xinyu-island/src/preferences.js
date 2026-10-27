const values=new Map([['xinyu.awoke','1']]);
export const preferences=__XINYU_DEMO__ ? {getItem:k=>values.get(k)??null,setItem:(k,v)=>values.set(k,String(v)),removeItem:k=>values.delete(k),reset(){values.clear();values.set('xinyu.awoke','1')}} : window.localStorage;
