import { EntityRepository, Repository } from 'typeorm';
import { UploadFile } from './upload_file.entity';

@EntityRepository(UploadFile)
export class UploadFileRepository extends Repository<UploadFile> {}
