import logo from './logo.svg';
import './App.css';
import axios from 'axios';
import { useEffect, useState } from 'react';
import * as XLSX from 'xlsx'
import { MdUploadFile } from 'react-icons/md'
import { BsFileEarmarkArrowDown } from 'react-icons/bs'
import { Badge, Button, Chip, Dialog, Link, Paper, styled, Table, TableBody, TableCell, TableContainer, TableHead, TablePagination, TableRow, Typography } from '@mui/material';
import { margin } from '@mui/system';
import ExcelDemo from './documents/Estudiantes.xlsx'



const Input = styled('input')({
  // display: 'none',
});
function App() {


  const [data, setdata] = useState([])
  
  const [studentsArray, setStudentsArray] = useState([])
  const [existStudent, SetExistStudent] = useState([])
  const [activeModal, setActiveModal] = useState(false)
  const [activeModal2, setActiveModal2] = useState(true)


  const getStudent = async () => {
    try {
      // const students = await axios.get('https://localhost:8080/student')
      const students = await axios.get('https://excel-to-back-end.herokuapp.com/student')
      console.log(students.data);
      setdata(students.data)
    } catch (error) {
      console.log(error)
    }

  }

  const CleanDataUpdated = () => {
    setStudentsArray([])

    SetExistStudent([])
    setActiveModal(false)
    setActiveModal2(true)
  }

  useEffect(() => {
    getStudent()

  }, [studentsArray])


  const onChangeFile = (e) => {
    const file = e.target.files[0];

    readExcel(file);
  }

  const readExcel = (file) => {

    const promise = new Promise((resolve, reject) => {
      const fileReader = new FileReader();
      fileReader.readAsArrayBuffer(file);
      fileReader.onload = (e) => {
        const bufferArray = e.target.result;

        const wb = XLSX.read(bufferArray, { type: "buffer" });

        const wsname = wb.SheetNames[0];

        const ws = wb.Sheets[wsname];

        const dataSTudent = XLSX.utils.sheet_to_json(ws)
        const nuevoArray = dataSTudent.filter(da => da.dni != undefined && da.name != undefined)
        resolve(nuevoArray);
      };

      fileReader.onerror = (error) => {
        reject(error)
      }
    }


    );

    promise.then((d) => {
      setStudentsArray(d)
      console.log(d)

      if (d.length > 0) {
        // alert("abriendo modal")
      }
    })
  }

  const postArrayStudents = async () => {
    if (studentsArray.length > 0) {
      // axios.post('http://localhost:8080/student', studentsArray)
      // let dataAlready = await axios.post('http://localhost:8080/student/already', studentsArray)

      axios.post('https://excel-to-back-end.herokuapp.com/student', studentsArray)
      let dataAlready = await axios.post('https://excel-to-back-end.herokuapp.com/student/already', studentsArray)

      console.log(dataAlready.data)

      SetExistStudent(dataAlready.data)
      setActiveModal(false)
      setStudentsArray([])
      getStudent();



    } else {
      alert("no hay ningun archivo excel");
    }
  }

  return (
    <>
      <div style={{ textAlign: 'center' }}>
        <h2 style={{ textAlign: 'center' }}>Demo Carga masiva desde un excel a la base de datos</h2>
        <Button sx={{ margin: "0 auto" }} variant="contained" color='success' endIcon={<BsFileEarmarkArrowDown />}><Link underline='none' color={"white"} href={ExcelDemo} target={"_blank"}>Descargar el Archivo de prueba</Link></Button>
      </div>
      <div style={{
        display: 'flex',
        justifyContent: 'space-around',
        paddingTop: 20,
        paddingBottom: 40
      }}>
        <Button variant='outlined' onClick={() => setActiveModal(true)} endIcon={<MdUploadFile size={20} />}>Importar Excel</Button>
        <OpenModal studentsArray={studentsArray} postArrayStudents={postArrayStudents} CleanDataUpdated={CleanDataUpdated} onChangeFile={onChangeFile} activeModal={activeModal} />

        {existStudent?.length > 0 && (
          <OpenModal studentsArray={existStudent} CleanDataUpdated={CleanDataUpdated} activeModal={activeModal2} />
        )}

      </div>

      <TableStudent data={data} />
    </>
  );
}

export default App;


const TableStudent = ({ data }) => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);



  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(+event.target.value);
    setPage(0);
  };


  function createData(name, code, population, size) {
    const density = population / size;
    return { name, code, population, size, density };
  }
  return (

    <Paper sx={{width: "60%", margin: "auto"}}>

      <TableContainer sx={{ maxHeight: 500 }}>
        <Table stickyHeader size='medium' aria-label="sticky table">
          <TableHead sx={{ backgroundColor: 'peru' }}>
            <TableRow>
              <TableCell>Nombre </TableCell>
              <TableCell>Apellidos</TableCell>
              <TableCell>Nr de Documento</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data?.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((student) => (
                <TableRow hover role="checkbox" tabIndex={-1} key={student.dni + Math.random()}
                  sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                  <TableCell>{student.name}</TableCell>
                  <TableCell>{student.lastName}</TableCell>
                  <TableCell>{student.dni === null ? <Chip label="no registrado" color='primary' size='small'></Chip> : student.dni}</TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        rowsPerPageOptions={[10, 25, 100]}
        component="div"
        count={data.length}
        rowsPerPage={rowsPerPage}
        labelRowsPerPage="Cantida de filas para mostrar"
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
    </Paper>

  )
}


const OpenModal = ({ postArrayStudents, onChangeFile, activeModal, CleanDataUpdated, studentsArray }) => {

  let Titulo = postArrayStudents ? "Seleccione el documento Excel" : "Datos rechazados";
  let Parrafo1 = postArrayStudents ? "se estan cargando datos con DNI existente" : "fueron rechazados porque el DNI";
  let Parrafo2 = postArrayStudents ? "si el DNI esta vacio no se subira a la Base de datos" : "ya existe en la base datos";

  return (
    <Dialog onClose={() => CleanDataUpdated()} open={activeModal} maxWidth={"md"} fullWidth={true} >
      <Typography variant='h4' sx={{ textAlign: 'center' }} color={"peru"} paddingY={8}>{Titulo}</Typography>



      {postArrayStudents && (

        <label htmlFor="contained-button-file" style={{ textAlign: 'center', padding: 16 }}>

          <Input accept="xlsx" onChange={onChangeFile} id="contained-button-file" multiple type="file" />
          <Button type="submit" onClick={() => postArrayStudents()} variant='contained' >
            IMPORTAR ARCHIVO
          </Button>:

        </label>

      )
      }



      {studentsArray?.length > 0 && (
        <>
          <Typography pt={2} color={"gray"} fontWeight={700} textAlign={"center"}>{Parrafo1}</Typography>
          <Typography pb={2} color={"gray"} fontSize={12} textAlign={"center"}>{Parrafo2}</Typography>
          <TableStudent data={studentsArray} />
        </>)

      }

    </Dialog>
  )
}