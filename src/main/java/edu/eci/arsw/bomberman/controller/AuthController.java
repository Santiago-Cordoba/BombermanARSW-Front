package edu.eci.arsw.bomberman.controller;

import edu.eci.arsw.bomberman.model.User;
import edu.eci.arsw.bomberman.service.AuthService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*") // Permite CORS para desarrollo
public class AuthController {
    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    public ResponseEntity<String> register(@RequestBody User user) {
        try {
            if (authService.registerUser(user.getUsername(), user.getPassword())) {
                return ResponseEntity.ok("Registration successful");
            }
            return ResponseEntity.badRequest().body("Username already exists");
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Error during registration");
        }
    }

    @PostMapping("/login")
    public ResponseEntity<String> login(@RequestBody User user) {
        try {
            if (authService.authenticateUser(user.getUsername(), user.getPassword())) {
                return ResponseEntity.ok("Login successful");
            }
            return ResponseEntity.status(401).body("Invalid credentials");
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Error during authentication");
        }
    }
}
