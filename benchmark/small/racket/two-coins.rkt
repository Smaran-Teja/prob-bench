#lang roulette/example/disrupt
(provide main)


(define first-coin (flip 0.5))
(define second-coin (flip 0.5))
(define both-heads (&& first-coin second-coin))
(observe! (! both-heads))

(define (main) (query first-coin))


(module+ main
  (main))
