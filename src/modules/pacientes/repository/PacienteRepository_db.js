import { Paciente } from "../domain/Paciente";
import { PacienteService } from "../service/PacienteService";
import { pacienteModel } from "../../../schemas/PacienteSchema";
class PacienteRepository{
  constructor(){
    this.model = pacienteModel
  }

  async findall(){
    return await 
  }


}