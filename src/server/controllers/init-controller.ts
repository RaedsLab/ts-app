import { Get, Route, Tags } from "tsoa";

@Route("init")
export class InitController {
  @Get()
  @Tags("Init")
  public async GetValue() {
    return "init";
  }
}
