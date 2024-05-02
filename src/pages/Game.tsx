import React, { useEffect, useRef, useState } from "react";
import "./Game.css";
import {
  useWebSocketContext,
  WebSocketContextProvider,
} from "../components/WebsocketContext";
import { Room } from "./Room";
import { useRoomContext } from "../components/RoomContext";
import { Player, Routes } from "../types";
import { InputField } from "../components/InputField";
import { useNavigationContext } from "../components/NavigationContext";
import { SocketEventType } from "../constants";
import { Button } from "../components/Button";
import { useParams } from "react-router-dom";

interface Props {
  hardMode?: boolean;
}

export const GameContainer: React.FC<{}> = () => {
  const { setShowNavBar, setNavItems } = useNavigationContext();
  useEffect(() => {
    setShowNavBar(true);
    setNavItems(
      <a className="navbar-item" href={Routes.HowToPlay}>
        How To Play
      </a>,
    );
  }, [setNavItems, setShowNavBar]);

  return (
    <WebSocketContextProvider>
      <Setup />
    </WebSocketContextProvider>
  );
};

export const Setup: React.FC<Props> = ({ hardMode }) => {
  const { socket } = useWebSocketContext();
  const createRoomInput = useRef<HTMLInputElement>(null);
  const joinRoomInput = useRef<HTMLInputElement>(null);
  const setPlayerNameInput = useRef<HTMLInputElement>(null);
  const { playerName, createRoom, joinRoom, setPlayerName } = useRoomContext();
  const { roomId } = useParams();
  const [roomCurrentPlayer, setRoomCurrentPlayer] = useState<Player>({
    id: socket.id,
    name: "Player",
    isTurn: false,
  });
  const [roomHasEnoughPlayers, setRoomHasEnoughPlayers] =
    useState<boolean>(false);

  useEffect(() => {
    if (socket) {
      if (!roomId) {
        createRoomInput.current?.focus();
      } else if (!playerName) {
        setPlayerNameInput.current?.focus();
      }
    }
  }, [socket, roomId, playerName]);

  useEffect(() => {
    socket.on(SocketEventType.RoomJoined, ({ currentPlayer, playerCount }) => {
      setRoomCurrentPlayer(currentPlayer);
      setRoomHasEnoughPlayers(playerCount > 1);
    });
  }, [socket]);

  if (!roomId) {
    return (
      <>
        <Button
          label="Create new room"
          onClick={() => {
            createRoom();
          }}
        />
        <InputField
          inputProps={{
            id: "room-id",
            name: "room-id",
            placeholder: "Enter a game room Id",
          }}
          inputRef={joinRoomInput}
          buttonLabel="Join an existing room"
          onClick={() => {
            var input = document.querySelector("#room-id") as HTMLInputElement;
            joinRoom(input.value);
          }}
        />
      </>
    );
  }

  if (!playerName) {
    return (
      <InputField
        inputProps={{
          id: "player-name",
          name: "player-name",
          placeholder: "Enter your player name",
          defaultValue: "",
        }}
        inputRef={setPlayerNameInput}
        buttonLabel="Set Player Name"
        onClick={() => {
          var input = document.querySelector(
            "#player-name",
          ) as HTMLInputElement;
          setPlayerName(roomId, socket.id, input.value);
        }}
      />
    );
  }

  return (
    <Room
      roomId={roomId}
      socket={socket}
      currentPlayer={roomCurrentPlayer}
      roomHasEnoughPlayers={roomHasEnoughPlayers}
    />
  );
};
