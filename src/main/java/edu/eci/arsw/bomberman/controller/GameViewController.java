package edu.eci.arsw.bomberman.controller;

import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;

@Controller
@RequestMapping("/game")
public class GameViewController {

    @GetMapping("/play")
    public String playGame(
            @RequestParam String code,
            @RequestParam String user,
            Model model) {

        model.addAttribute("gameCode", code);
        model.addAttribute("username", user);
        return "play"; // play.html debe estar en src/main/resources/templates/
    }
}