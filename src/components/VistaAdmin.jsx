import React from 'react'
import { db, functions } from "../firebase"

const VistaAdmin = () => {
  const [usuarios, setUsuarios] = React.useState([])

  React.useEffect(() => {
    fetchUsuarios()
  }, [])

  const fetchUsuarios = async () => {
    try {
      const res = await db.collection("usuarios").get()
      const arrayUsuarios = res.docs.map(doc => doc.data())
      setUsuarios(arrayUsuarios)
    } catch (error) {
      console.log(error)
    }
  }

  const administrador = (email) => {
    if (!email.trim()) {
      return console.log("email vacio")
    }

    //accediendo a custom claim
    const agregarRol = functions.httpsCallable("agregarAdministrador")

    agregarRol({ email: email })
      .then(res => {
        console.log(res)
        if (res.data.error) {
          console.log("No tienes permisos")
          return
        }
        //modificando el rol de invitado a admin
        db.collection("usuarios").doc(email).update({ rol: "admin" })
          .then(user => {
            console.log("usuario modificado rol administrador")
            //leyendo otra vez la BD, para que se haga el cambio de rol
            fetchUsuarios()
          })
      })
  }

  const crearAutor = (email) => {
    const agregarRol = functions.httpsCallable("crearAutor")
    agregarRol({ email: email })
      .then(res => {
        console.log(res)
        if (res.data.error) {
          console.log("No tiene permisos")
          return
        }
        db.collection("usuarios").doc(email).update({ rol: "autor" })
          .then(user => {
            console.log("usuario modificado rol autor")
            //leyendo otra vez la BD, para que se haga el cambio de rol
            fetchUsuarios()
          })
      })
      .catch(error => console.log(error))


  }

  const eliminarAutor = email => {
    //tomando la funcion del backend
    const agregarRol = functions.httpsCallable("eliminarAutor")
    //lee el email
    agregarRol({ email: email })
      .then(res => {
        console.log(res)
        //si tiene error
        if (res.data.error) {
          console.log("No tienes permismos")
          return
        }
        //no hay errores
        db.collection("usuarios").doc(email).update({ rol: "invitado" })
          .then(user => {
            console.log("Usuario modificado rol lector")
            fetchUsuarios()
          })
      })
  }

  const eliminarAdministrador = email => {
    //tomando la funcion del backend
    const agregarRol = functions.httpsCallable("eliminarAdministrador")
    //lee el email
    agregarRol({ email: email })
      .then(res => {
        console.log(res)
        //si tiene error
        if (res.data.error) {
          console.log("No tienes permismos")
          return
        }
        //no hay errores
        db.collection("usuarios").doc(email).update({ rol: "invitado" })
          .then(user => {
            console.log("Usuario modificado rol lector")
            fetchUsuarios()
          })
      })
  }

  return (
    <div>
      <h3>Administración de usuarios</h3>
      {usuarios.map(usuario => (
        //.uid, .email, .rol -> son propiedades que estan en la BD.
        <div key={usuario.uid} className="mb-2">
          {usuario.email} - rol: {usuario.rol}
          {
            usuario.rol === "admin" ? (
              <button
                className="btn btn-danger mx-2"
                onClick={() => eliminarAdministrador(usuario.email)}>
                Eliminar Admin
              </button>
            ) : (
                <>
                  <button
                    className="btn btn-dark mx-2"
                    onClick={() => administrador(usuario.email)}>
                    Administardor
            </button>

                  <button
                    className="btn btn-success mx-2"
                    onClick={() => crearAutor(usuario.email)}>
                    Autor
                  </button>
                  <button
                    className="btn btn-info mx-2"
                    onClick={() => eliminarAutor(usuario.email)}>
                    Invitado
              </button>
                </>
              )
          }

        </div>
      ))}
    </div>
  )
}

export default VistaAdmin
