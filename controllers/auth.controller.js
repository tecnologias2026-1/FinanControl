const supabase = require("../config/supabase");
const bcrypt = require("bcrypt");

const register = async (req, res) => {
  try {
    const { nombre, correo, password } = req.body;

    const { data: usuarioExiste } = await supabaseClient
      .from("USUARIOS")
      .select("*")
      .eq("correo", correo)
      .single();

    if (usuarioExiste) {
      return res.status(400).json({
        mensaje: "El correo ya está registrado"
      });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const { data, error } = await supabaseClient
      .from("USUARIOS")
      .insert([
        {
          nombre,
          correo,
          password: passwordHash
        }
      ])
      .select();

    if (error) {
      return res.status(500).json({
        error: error.message
      });
    }

    res.status(201).json({
      mensaje: "Usuario registrado correctamente",
      data
    });

  } catch (error) {
    res.status(500).json({
      error: error.message
    });
  }
};

const login = async (req, res) => {
  try {
    const { correo, password } = req.body;

    const { data: usuario } = await supabaseClient
      .from("USUARIOS")
      .select("*")
      .eq("correo", correo)
      .single();

    if (!usuario) {
      return res.status(404).json({
        mensaje: "Usuario no encontrado"
      });
    }

    const passwordCorrecta = await bcrypt.compare(
      password,
      usuario.password
    );

    if (!passwordCorrecta) {
      return res.status(401).json({
        mensaje: "Contraseña incorrecta"
      });
    }

    res.status(200).json({
      mensaje: "Login exitoso",
      usuario: {
        id: usuario.id,
        nombre: usuario.nombre,
        correo: usuario.correo
      }
    });

  } catch (error) {
    res.status(500).json({
      error: error.message
    });
  }
};

module.exports = {
  register,
  login
};