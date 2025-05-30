package room

type RoundNode struct {
	PlayerID string
	Next     *RoundNode
	Prev     *RoundNode
}

type Player struct {
	Id         string     `json:"id"`
	Name       string     `json:"name"`
	IsTurn     bool       `json:"isTurn"`
	Eliminated bool       `json:"eliminated"`
	WinCount   int        `json:"winCount"`
	Connected  bool       `json:"connected"`
	InRound    *RoundNode `json:"-"`
}

type Players struct {
	players       map[string]*Player
	roundHead     *RoundNode
	roundTail     *RoundNode
	currentNode   *RoundNode
	Count         int
	RoundActive   bool    `json:"roundActive"`
	RoundWinner   *Player `json:"roundWinner"`
}

func NewPlayers() *Players {
	return &Players{
		players:     make(map[string]*Player),
		roundHead:   nil,
		roundTail:   nil,
		currentNode: nil,
		Count:       0,
		RoundActive: false,
		RoundWinner: nil,
	}
}

func newPlayer(id string, name string, isTurn bool) *Player {
	return &Player{
		Id:         id,
		Name:       name,
		IsTurn:     isTurn,
		Eliminated: false,
		WinCount:   0,
		Connected:  true,
	}
}

func (p *Players) AddPlayer(id, name string, isTurn bool) {
	player := newPlayer(id, name, isTurn)
	p.players[id] = player
	p.Count++
}

func (p *Players) HandleDisconnect(id string) {
	if player, exists := p.players[id]; exists {
		player.Connected = false
		if p.RoundActive {
			p.EliminatePlayer(id)
		}
	}
}

func (p *Players) HandleReconnect(id string) bool {
	if player, exists := p.players[id]; exists {
		player.Connected = true
		return true
	}
	return false
}

func (p *Players) StartRound() {
	if p.Count < 2 {
		return
	}

	p.RoundActive = true
	p.RoundWinner = nil

	// Build round order from connected players
	p.roundHead = nil
	p.roundTail = nil
	p.currentNode = nil

	for id, player := range p.players {
		if player.Connected {
			player.Eliminated = false
			node := &RoundNode{PlayerID: id}

			if p.roundHead == nil {
				p.roundHead = node
				p.roundTail = node
				p.currentNode = node
			} else {
				p.roundTail.Next = node
				node.Prev = p.roundTail
				p.roundTail = node
			}
		}
	}

	// Make it circular
	if p.roundHead != nil {
		p.roundHead.Prev = p.roundTail
		p.roundTail.Next = p.roundHead
	}
}

func (p *Players) EliminatePlayer(id string) {
	if !p.RoundActive {
		return
	}

	player, exists := p.players[id]
	if !exists {
		return
	}

	player.Eliminated = true

	// Find and remove from round order
	curr := p.roundHead
	for curr != nil {
		if curr.PlayerID == id {
			// Remove node from round order
			if curr == p.roundHead {
				p.roundHead = curr.Next
			}
			if curr == p.roundTail {
				p.roundTail = curr.Prev
			}
			if curr == p.currentNode {
				p.currentNode = curr.Next
			}

			curr.Prev.Next = curr.Next
			curr.Next.Prev = curr.Prev
			break
		}
		curr = curr.Next
		if curr == p.roundHead {
			break
		}
	}

	// Check if round is complete
	if p.roundHead == p.roundTail {
		p.RoundActive = false
		winner := p.players[p.roundHead.PlayerID]
		p.RoundWinner = winner
		winner.WinCount++
	}
}

func (p *Players) GetCurrentPlayer() *Player {
	if p.currentNode == nil {
		return nil
	}
	return p.players[p.currentNode.PlayerID]
}

func (p *Players) MoveToNextPlayer() {
	if p.currentNode != nil {
		p.currentNode = p.currentNode.Next
	}
}

func (p *Players) GetGameWinner() *Player {
	for _, player := range p.players {
		if player.WinCount >= 3 {
			return player
		}
	}
	return nil
}

func (p *Players) GetActivePlayers() []*Player {
	if !p.RoundActive {
		return nil
	}

	activePlayers := make([]*Player, 0)
	if p.roundHead == nil {
		return activePlayers
	}

	curr := p.roundHead
	for {
		activePlayers = append(activePlayers, p.players[curr.PlayerID])
		curr = curr.Next
		if curr == p.roundHead {
			break
		}
	}
	return activePlayers
}

func (p *Players) ToPlayersMap() map[string]*Player {
	return p.players
}

func (p *Players) RemovePlayer(id string) {
	if player, exists := p.players[id]; exists {
		// Remove from round order if in a round
		if p.RoundActive && player.InRound != nil {
			node := player.InRound
			if node == p.roundHead {
				p.roundHead = node.Next
			}
			if node == p.roundTail {
				p.roundTail = node.Prev
			}
			if node == p.currentNode {
				p.currentNode = node.Next
			}

			if node.Prev != nil {
				node.Prev.Next = node.Next
			}
			if node.Next != nil {
				node.Next.Prev = node.Prev
			}
		}

		// Remove from players map
		delete(p.players, id)
		p.Count--

		// Check if round is complete
		if p.RoundActive && p.roundHead == p.roundTail {
			p.RoundActive = false
			winner := p.players[p.roundHead.PlayerID]
			p.RoundWinner = winner
			winner.WinCount++
		}
	}
}
