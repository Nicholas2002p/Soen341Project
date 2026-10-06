import type { Company } from '../../../domain/entities/Company.js';
import type { CompanyData } from '../repositories/ICompanyRepository.js';

export interface ICompanyService {
    /**
     * returns all the companies in the Database
     * 
     * @returns a promise that will eventually return an array of company objects
     */
    getAll(): Promise<Company[]>;

    /**
     * returns a singular company in the database
     * 
     * @param companyId an interger ID of a company in the database
     * @returns a promise that will eventually return a single company or null
     */
    getById(companyId: number): Promise<Company | null>;

    /**
     * creates a new company
     * 
     * @param data data used to create a new company
     * @returns a promise that will eventually return a single company
     */
    create(data: CompanyData): Promise<Company>;

    /**
     * updates an existing company 
     * 
     * @param companyId an interger ID of a company in the database
     * @param data data used to update an existing company
     * @returns a promise that will eventually return a single company or null
     */
    update(companyId: number, data: CompanyData,): Promise<Company | null>;

    /**
     * deletes a company from the database
     * 
     * @param companyId an interger ID of a company in the database
     * @returns a boolean
     */
    delete(companyId: number): Promise<boolean>;
}