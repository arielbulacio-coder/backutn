const authorize = (roles = []) => {
    // roles param can be a single string (e.g. 'admin') or an array of strings (['admin', 'user'])
    if (typeof roles === 'string') {
        roles = [roles];
    }

    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ message: 'No autenticado' });
        }

        if (roles.length && !roles.includes(req.user.role)) {
            // Role not authorized
            return res.status(403).json({ message: 'Acceso prohibido: No tienes los permisos necesarios' });
        }

        // Authentication and Authorization successful
        next();
    };
};

module.exports = authorize;
