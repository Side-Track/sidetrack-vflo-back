import { HttpStatus } from '@nestjs/common';
import { ResponseDto } from 'src/dto/response.dto';
import { ResponseCode } from 'src/response.code.enum';
import { EntityRepository, getConnection, Repository } from 'typeorm';
import { UploadFile } from './upload_file.entity';

@EntityRepository(UploadFile)
export class UploadFileRepository extends Repository<UploadFile> {
	async saveFile(uploadFile: UploadFile): Promise<UploadFile> {
		const queryRunner = getConnection().createQueryRunner();
		await queryRunner.connect();

		await queryRunner.startTransaction();

		try {
			const uploadedFile: UploadFile = await this.save(uploadFile);
			await queryRunner.commitTransaction();

			return uploadedFile;
		} catch (err) {
			// rollback
			await queryRunner.rollbackTransaction();
		} finally {
			await queryRunner.release();
		}
	}
}
