package edu.eci.arsw.bomberman.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class WebController {

    @GetMapping("/")
    public String index() {
        return "forward:/index.html";
    }

    @GetMapping("/game")
    public String game() {
        return "forward:/game.html";
    }

    @GetMapping("/lobby")
    public String lobby() {
        return "forward:/lobby.html";
    }

    @GetMapping("/play")
    public String play() {
        return "forward:/play.html";
    }
}