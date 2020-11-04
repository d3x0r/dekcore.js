:browserify  --ignore-missing --node json6.js salty_random_generator.js u8xor.js id_generator.js config.js protocol.js app.js > app.es6.js


call google-closure-compiler.cmd --language_out NO_TRANSPILE   --js=json6.js --js=salty_random_generator.js --js=u8xor.js --js=id_generator.js  --js=protocol.js --js=app.js   --js_output_file=app.es6.js 
call google-closure-compiler.cmd --language_out NO_TRANSPILE --formatting=pretty_print  --js=json6.js --js=salty_random_generator.js --js=u8xor.js --js=id_generator.js --js=protocol.js  --js=app.js   --js_output_file=app.es6.dbg.js 

call google-closure-compiler.cmd --language_out ECMASCRIPT3   --js=json6.js --js=salty_random_generator.js --js=u8xor.js --js=id_generator.js --js=protocol.js --js=app.js  --js_output_file=app.es3.js 

node ../../util/crypt/crypt0.js app.es6.js app.es6.e.js
node ../../util/crypt/crypt0.es3.js app.es3.js app.es3.e.js
: spread operator fix.
call google-closure-compiler.cmd --language_out ECMASCRIPT3   --js=app.es3.e.js --js_output_file=app.es3.e.es3.js 

copy /B app.header.js+app.es6.e.js+app.footer.js app.es6.all.js

