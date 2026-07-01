/*
  Warnings:

  - A unique constraint covering the columns `[qrCode]` on the table `Item` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[qrCode]` on the table `Loan` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[nim]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `dueDate` to the `Loan` table without a default value. This is not possible if the table is not empty.
  - Added the required column `nim` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `item` ADD COLUMN `qrCode` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `loan` ADD COLUMN `dueDate` DATETIME(3) NOT NULL,
    ADD COLUMN `qrCode` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `user` ADD COLUMN `nim` VARCHAR(191) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX `Item_qrCode_key` ON `Item`(`qrCode`);

-- CreateIndex
CREATE UNIQUE INDEX `Loan_qrCode_key` ON `Loan`(`qrCode`);

-- CreateIndex
CREATE UNIQUE INDEX `User_nim_key` ON `User`(`nim`);
