package edu.eci.arsw.bomberman.repository;

import edu.eci.arsw.bomberman.model.User;
import org.springframework.stereotype.Repository;

import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentMap;
import java.util.Optional;

@Repository
public class UserRepository {
    // Mapa concurrente para almacenar usuarios (username -> User)
    private final ConcurrentMap<String, User> users = new ConcurrentHashMap<>();

    /**
     * Verifica si un usuario existe dado su nombre de usuario
     * @param username Nombre de usuario a verificar
     * @return true si existe, false si no
     */
    public boolean existsByUsername(String username) {
        return users.containsKey(username);
    }

    /**
     * Busca un usuario por su nombre de usuario
     * @param username Nombre de usuario a buscar
     * @return El usuario encontrado o null si no existe
     */
    public User findByUsername(String username) {
        return users.get(username);
    }

    /**
     * Versión mejorada que retorna Optional
     * @param username Nombre de usuario a buscar
     * @return Optional conteniendo el usuario si existe
     */
    public Optional<User> findOptionalByUsername(String username) {
        return Optional.ofNullable(users.get(username));
    }

    /**
     * Guarda un usuario en el repositorio
     * @param user Usuario a guardar
     * @throws IllegalArgumentException si el usuario o username son null
     */
    public void save(User user) {
        if (user == null) {
            throw new IllegalArgumentException("User cannot be null");
        }
        if (user.getUsername() == null || user.getUsername().isEmpty()) {
            throw new IllegalArgumentException("Username cannot be null or empty");
        }
        users.put(user.getUsername(), user);
    }

    /**
     * Elimina un usuario del repositorio
     * @param username Nombre de usuario a eliminar
     * @return El usuario eliminado o null si no existía
     */
    public User deleteByUsername(String username) {
        return users.remove(username);
    }

    /**
     * @return Número de usuarios en el repositorio
     */
    public long count() {
        return users.size();
    }

    /**
     * Elimina todos los usuarios del repositorio
     */
    public void deleteAll() {
        users.clear();
    }
}
