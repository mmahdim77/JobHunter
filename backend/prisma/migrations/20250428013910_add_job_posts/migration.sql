-- CreateTable
CREATE TABLE "JobPost" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "company" TEXT NOT NULL,
    "companyUrl" TEXT,
    "jobUrl" TEXT NOT NULL,
    "country" TEXT,
    "city" TEXT,
    "state" TEXT,
    "isRemote" BOOLEAN NOT NULL DEFAULT false,
    "description" TEXT NOT NULL,
    "jobType" TEXT NOT NULL,
    "jobFunction" TEXT,
    "salaryInterval" TEXT,
    "salaryMinAmount" DOUBLE PRECISION,
    "salaryMaxAmount" DOUBLE PRECISION,
    "salaryCurrency" TEXT,
    "salarySource" TEXT,
    "datePosted" TIMESTAMP(3) NOT NULL,
    "emails" TEXT,
    "jobLevel" TEXT,
    "companyIndustry" TEXT,
    "companyCountry" TEXT,
    "companyAddresses" TEXT,
    "companyEmployees" TEXT,
    "companyRevenue" TEXT,
    "companyDescription" TEXT,
    "companyLogo" TEXT,
    "skills" TEXT,
    "experienceRange" TEXT,
    "companyRating" DOUBLE PRECISION,
    "companyReviews" INTEGER,
    "vacancyCount" INTEGER,
    "workFromHomeType" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "JobPost_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "JobPost" ADD CONSTRAINT "JobPost_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
