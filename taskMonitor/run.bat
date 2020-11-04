pskill node

del log.6
rename log.5 log.6
rename log.4 log.5
rename log.3 log.4
rename log.2 log.3
rename log.1 log.2
rename log log.1

:node --inspect-brk ..\node\common\node.js >log 2>&1

node ..\node\common\node.js >log 2>&1
