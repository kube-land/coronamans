package main

import (
	"github.com/julienschmidt/httprouter"
)

type Handler func(httprouter.Handle) httprouter.Handle

type Chain struct {
	handlers []Handler
}

func NewChain(handlers ...Handler) Chain {
	return Chain{append(([]Handler)(nil), handlers...)}
}

func (s Chain) Then(h httprouter.Handle) httprouter.Handle {
	for i := range s.handlers {
		h = s.handlers[len(s.handlers)-1-i](h)
	}

	return h
}

func (s Chain) Append(handlers ...Handler) Chain {
	newHandlers := make([]Handler, 0, len(s.handlers)+len(handlers))
	newHandlers = append(newHandlers, s.handlers...)
	newHandlers = append(newHandlers, handlers...)

	return Chain{newHandlers}
}

func (s Chain) Extend(chain Chain) Chain {
	return s.Append(chain.handlers...)
}
