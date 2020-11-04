Gun.chain.path = function(f, cb, o){
var g=this, tmp;
o = o || {}; o.path = true;
if(g === g._.root){if(cb){cb({err: Gun.log("Can't do that on root instance.")})}return g}
if(typeof f === 'string'){
tmp = f.split(o.split || '.');
if(1 === tmp.length) g = g.get(f, cb, o); else d(tmp);
} else if(f instanceof Array){
if(f.length > 1) d(f); else g = g.get(f[0], cb, o);
}
else if(!f && 0 != f){
return back;
}
else g = this.get(''+f, cb, o);
g._.opt = o;
return g;
function d( f ) {
for(var i; i < f.length; i++){
g = g.get(f[i], (i+1 === l)? cb : null, o);
}
}
}
