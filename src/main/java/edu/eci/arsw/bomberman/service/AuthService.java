package edu.eci.arsw.bomberman.service;

import edu.eci.arsw.bomberman.model.User;
import edu.eci.arsw.bomberman.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public AuthService(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public boolean registerUser(String username, String password) {
        if (userRepository.existsByUsername(username)) {
            return false;
        }
        User newUser = new User();
        newUser.setUsername(username);
        newUser.setPassword(passwordEncoder.encode(password)); // Asegúrate de codificar la contraseña
        userRepository.save(newUser);
        return true;
    }

    public boolean authenticateUser(String username, String password) {
        User user = userRepository.findByUsername(username);
        // Verifica que el usuario exista y que la contraseña coincida (comparando hashes)
        return user != null && passwordEncoder.matches(password, user.getPassword());
    }
}
