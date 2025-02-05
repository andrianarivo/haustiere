-- CreateTable
CREATE TABLE "Cat" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "age" INTEGER NOT NULL,
    "breed" TEXT,

    CONSTRAINT "Cat_pkey" PRIMARY KEY ("id")
);
