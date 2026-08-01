#lang roulette/example/disrupt
(provide main)

(define evidence (flip 0.5))
(define coin (flip 0.5))

(define (main)
  (query (cond
           [evidence
            (observe! coin)
            evidence]
           [else evidence])))


(module+ main
  (main))
