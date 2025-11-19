<?php
include 'config/session.php';
include 'config/database.php';
include 'models/User.php';

Session::init();

$database = new Database();
$db = $database->getConnection();
$user = new User($db);

$action = isset($_GET['action']) ? $_GET['action'] : '';
$message = '';

// Crear usuario
if(isset($_POST['create'])) {
    $user->nombre = $_POST['nombre'];
    $user->email = $_POST['email'];
    $user->fecha_nacimiento = $_POST['fecha_nacimiento'];
    $user->pais = $_POST['pais'];
    $user->tipo_cuenta = $_POST['tipo_cuenta'];
    $user->saldo = $_POST['saldo'];

    if($user->create()) {
        $message = '<div class="alert alert-success">Usuario creado exitosamente.</div>';
    } else {
        $message = '<div class="alert alert-danger">Error al crear usuario.</div>';
    }
}

// Actualizar usuario
if(isset($_POST['update'])) {
    $user->id_usuario = $_POST['id_usuario'];
    $user->nombre = $_POST['nombre'];
    $user->email = $_POST['email'];
    $user->tipo_cuenta = $_POST['tipo_cuenta'];
    $user->saldo = $_POST['saldo'];
    $user->fecha_nacimiento = $_POST['fecha_nacimiento'];
    $user->pais = $_POST['pais'];

    if($user->update()) {
        $message = '<div class="alert alert-success">Usuario actualizado exitosamente.</div>';
    } else {
        $message = '<div class="alert alert-danger">Error al actualizar usuario.</div>';
    }
}

// Eliminar usuario
if($action == 'delete') {
    $user->id_usuario = $_GET['id'];
    if($user->delete()) {
        $message = '<div class="alert alert-success">Usuario eliminado exitosamente.</div>';
    } else {
        $message = '<div class="alert alert-danger">Error al eliminar usuario.</div>';
    }
}

// Buscar usuarios
$keywords = isset($_GET['search']) ? $_GET['search'] : '';
if($keywords) {
    $stmt = $user->search($keywords);
} else {
    $stmt = $user->read();
}
?>

<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Gestión de Usuarios - Spotify Clone</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css" rel="stylesheet">
    <style>
        body {
            background: #191414;
            color: white;
            min-height: 100vh;
        }
        .sidebar {
            background: #000000;
            min-height: 100vh;
            padding: 20px;
        }
        .main-content {
            padding: 20px;
        }
        .nav-link {
            color: #b3b3b3;
            margin: 10px 0;
        }
        .nav-link:hover {
            color: white;
        }
        .nav-link.active {
            color: white;
            font-weight: bold;
        }
        .card-spotify {
            background: #282828;
            border: none;
            border-radius: 10px;
            margin-bottom: 20px;
        }
        .btn-spotify {
            background: #1db954;
            border: none;
            color: white;
        }
        .btn-spotify:hover {
            background: #1ed760;
        }
        .table-dark {
            background: #282828;
        }
    </style>
</head>
<body>
    <div class="container-fluid">
        <div class="row">
            <!-- Sidebar -->
            <div class="col-md-2 sidebar">
                <div class="d-flex flex-column">
                    <h4 class="mb-4">MusicStream</h4>
                    <ul class="nav flex-column">
                        <li class="nav-item">
                            <a class="nav-link" href="dashboard.php">Inicio</a>
                        </li>
                        <li class="nav-item">
                            <a class="nav-link" href="profile.php">Mi Perfil</a>
                        </li>
                        <li class="nav-item">
                            <a class="nav-link active" href="users.php">Gestión de Usuarios</a>
                        </li>
                        <li class="nav-item">
                            <a class="nav-link" href="logout.php">Cerrar Sesión</a>
                        </li>
                    </ul>
                </div>
            </div>

            <!-- Main Content -->
            <div class="col-md-10 main-content">
                <div class="d-flex justify-content-between align-items-center mb-4">
                    <h2>Gestión de Usuarios</h2>
                    <button class="btn btn-spotify" data-bs-toggle="modal" data-bs-target="#createUserModal">
                        Crear Usuario
                    </button>
                </div>

                <?php echo $message; ?>

                <!-- Formulario de Búsqueda -->
                <div class="card card-spotify mb-4">
                    <div class="card-body">
                        <form method="GET">
                            <div class="input-group">
                                <input type="text" class="form-control" name="search" placeholder="Buscar usuarios..." value="<?php echo $keywords; ?>">
                                <button class="btn btn-spotify" type="submit">Buscar</button>
                                <?php if($keywords): ?>
                                    <a href="users.php" class="btn btn-secondary">Limpiar</a>
                                <?php endif; ?>
                            </div>
                        </form>
                    </div>
                </div>

                <!-- Tabla de Usuarios -->
                <div class="card card-spotify">
                    <div class="card-body">
                        <div class="table-responsive">
                            <table class="table table-dark table-hover">
                                <thead>
                                    <tr>
                                        <th>ID</th>
                                        <th>Nombre</th>
                                        <th>Email</th>
                                        <th>Tipo de Cuenta</th>
                                        <th>Fecha Registro</th>
                                        <th>Saldo</th>
                                        <th>Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <?php while ($row = $stmt->fetch(PDO::FETCH_ASSOC)): ?>
                                    <tr>
                                        <td><?php echo $row['id_usuario']; ?></td>
                                        <td><?php echo $row['nombre']; ?></td>
                                        <td><?php echo $row['email']; ?></td>
                                        <td>
                                            <span class="badge <?php echo $row['tipo_cuenta'] == 'Premium' ? 'bg-success' : 'bg-secondary'; ?>">
                                                <?php echo $row['tipo_cuenta']; ?>
                                            </span>
                                        </td>
                                        <td><?php echo $row['fecha_registro']; ?></td>
                                        <td>$<?php echo number_format($row['saldo'], 2); ?></td>
                                        <td>
                                            <button class="btn btn-sm btn-primary" 
                                                    data-bs-toggle="modal" 
                                                    data-bs-target="#editUserModal"
                                                    data-id="<?php echo $row['id_usuario']; ?>"
                                                    data-nombre="<?php echo $row['nombre']; ?>"
                                                    data-email="<?php echo $row['email']; ?>"
                                                    data-tipo="<?php echo $row['tipo_cuenta']; ?>"
                                                    data-saldo="<?php echo $row['saldo']; ?>"
                                                    data-fecha="<?php echo $row['fecha_nacimiento']; ?>"
                                                    data-pais="<?php echo $row['pais']; ?>">
                                                Editar
                                            </button>
                                            <a href="users.php?action=delete&id=<?php echo $row['id_usuario']; ?>" 
                                               class="btn btn-sm btn-danger"
                                               onclick="return confirm('¿Estás seguro de eliminar este usuario?')">
                                                Eliminar
                                            </a>
                                        </td>
                                    </tr>
                                    <?php endwhile; ?>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- Modal Crear Usuario -->
    <div class="modal fade" id="createUserModal" tabindex="-1">
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">Crear Nuevo Usuario</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                </div>
                <form method="POST">
                    <div class="modal-body">
                        <div class="mb-3">
                            <label class="form-label">Nombre</label>
                            <input type="text" class="form-control" name="nombre" required>
                        </div>
                        <div class="mb-3">
                            <label class="form-label">Email</label>
                            <input type="email" class="form-control" name="email" required>
                        </div>
                        <div class="mb-3">
                            <label class="form-label">Fecha Nacimiento</label>
                            <input type="date" class="form-control" name="fecha_nacimiento" required>
                        </div>
                        <div class="mb-3">
                            <label class="form-label">País</label>
                            <select class="form-control" name="pais" required>
                                <option value="México">México</option>
                                <option value="España">España</option>
                                <option value="Argentina">Argentina</option>
                                <option value="Colombia">Colombia</option>
                            </select>
                        </div>
                        <div class="mb-3">
                            <label class="form-label">Tipo de Cuenta</label>
                            <select class="form-control" name="tipo_cuenta" required>
                                <option value="Free">Free</option>
                                <option value="Premium">Premium</option>
                            </select>
                        </div>
                        <div class="mb-3">
                            <label class="form-label">Saldo</label>
                            <input type="number" step="0.01" class="form-control" name="saldo" value="0.00" required>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
                        <button type="submit" name="create" class="btn btn-spotify">Crear Usuario</button>
                    </div>
                </form>
            </div>
        </div>
    </div>

    <!-- Modal Editar Usuario -->
    <div class="modal fade" id="editUserModal" tabindex="-1">
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">Editar Usuario</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                </div>
                <form method="POST">
                    <div class="modal-body">
                        <input type="hidden" name="id_usuario" id="edit_id">
                        <div class="mb-3">
                            <label class="form-label">Nombre</label>
                            <input type="text" class="form-control" name="nombre" id="edit_nombre" required>
                        </div>
                        <div class="mb-3">
                            <label class="form-label">Email</label>
                            <input type="email" class="form-control" name="email" id="edit_email" required>
                        </div>
                        <div class="mb-3">
                            <label class="form-label">Fecha Nacimiento</label>
                            <input type="date" class="form-control" name="fecha_nacimiento" id="edit_fecha" required>
                        </div>
                        <div class="mb-3">
                            <label class="form-label">País</label>
                            <select class="form-control" name="pais" id="edit_pais" required>
                                <option value="México">México</option>
                                <option value="España">España</option>
                                <option value="Argentina">Argentina</option>
                                <option value="Colombia">Colombia</option>
                            </select>
                        </div>
                        <div class="mb-3">
                            <label class="form-label">Tipo de Cuenta</label>
                            <select class="form-control" name="tipo_cuenta" id="edit_tipo" required>
                                <option value="Free">Free</option>
                                <option value="Premium">Premium</option>
                            </select>
                        </div>
                        <div class="mb-3">
                            <label class="form-label">Saldo</label>
                            <input type="number" step="0.01" class="form-control" name="saldo" id="edit_saldo" required>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
                        <button type="submit" name="update" class="btn btn-spotify">Actualizar Usuario</button>
                    </div>
                </form>
            </div>
        </div>
    </div>

    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/js/bootstrap.bundle.min.js"></script>
    <script>
        // Script para cargar datos en el modal de edición
        var editUserModal = document.getElementById('editUserModal');
        editUserModal.addEventListener('show.bs.modal', function (event) {
            var button = event.relatedButton;
            document.getElementById('edit_id').value = button.getAttribute('data-id');
            document.getElementById('edit_nombre').value = button.getAttribute('data-nombre');
            document.getElementById('edit_email').value = button.getAttribute('data-email');
            document.getElementById('edit_tipo').value = button.getAttribute('data-tipo');
            document.getElementById('edit_saldo').value = button.getAttribute('data-saldo');
            document.getElementById('edit_fecha').value = button.getAttribute('data-fecha');
            document.getElementById('edit_pais').value = button.getAttribute('data-pais');
        });
    </script>
</body>
</html>