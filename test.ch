(set assert
     (fn (msg condition)
       (print msg)
       (print ' - ')
       (print (if condition 'ok' 'failed'))
       (print '\n')))

(assert 'Read true' (= (read 'true') true))
(assert 'Read false' (= (read 'false') false))
(assert 'Read integer' (= (read '123') 123))

(assert 'Read atom with whitespace' (= (read ' 1 ') 1))
(assert 'Read list with whitespace' (= (read ' ( 1 ) ') (read '(1)')))

(if true (set foo 1) (set foo 2))
(assert 'Only evaluate one branch of if' (= foo 1))
