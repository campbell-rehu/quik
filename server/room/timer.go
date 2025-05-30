package room

import (
	"sync"
	"time"
)

type (
	TickChannel chan int
	DoneChannel chan bool
)

type Timer struct {
	started   bool
	timeLimit int
	tickCh    TickChannel
	doneCh    DoneChannel
	wg        sync.WaitGroup
}

func NewTimer() *Timer {
	tickCh := make(chan int)
	doneCh := make(chan bool)
	return &Timer{
		started:   false,
		timeLimit: DefaultTimerDuration,
		tickCh:    tickCh,
		doneCh:    doneCh,
		wg:        sync.WaitGroup{},
	}
}

func (t *Timer) reset() {
	t.started = false
	t.doneCh <- true
}

func (t *Timer) start(emitTick func(chan int, chan bool), onTimerExpiry func()) {
	t.wg.Add(1)

	// go routine to start the timer
	go t.doStart(onTimerExpiry)

	// go routine to receive the countdown ticks from the tickCh
	// and emit it back to the room
	go emitTick(t.tickCh, t.doneCh)

	t.wg.Wait()
}

func (t *Timer) doStart(onTimerExpiry func()) {
	t.started = true
	baseTime := t.timeLimit
	for {
		select {
		case <-t.doneCh:
			return
		default:
			t.tickCh <- baseTime
			if baseTime == 0 {
				t.wg.Done()
				onTimerExpiry()
				return
			}
			time.Sleep(time.Second * 1)
			baseTime--
		}
	}
}
