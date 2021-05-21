pipeline{
    agent {
    label 'main'
    }
    stages{
        stage('Pull from GitHub'){
            steps{
                git branch: 'main', credentialsId: 'tim github', url: 'https://github.com/tfedoris/MSCS_710_Software_Project.git'
            }
        }
        stage('End-to-end test'){
            steps{
                echo 'installing python and dependencies'
                powershell '''ls
                    Set-ExecutionPolicy Bypass -Scope Process -Force; iex ((New-Object System.Net.WebClient).DownloadString("https://chocolatey.org/install.ps1"))
                    '''
                bat '''C:\\ProgramData\\chocolatey\\bin\\choco feature enable -n allowGlobalConfirmation
                    C:\\ProgramData\\chocolatey\\bin\\choco.exe install python --version=3.8.0
                    C:\\python38\\scripts\\pip.exe install --upgrade pip
                    C:\\python38\\scripts\\pip.exe install psutil
                    C:\\python38\\scripts\\pip.exe install pandas
                    C:\\python38\\scripts\\pip.exe install sqlalchemy
                    C:\\python38\\scripts\\pip.exe install py-cpuinfo
                    C:\\python38\\scripts\\pip.exe install pycryptodomex
                    C:\\python38\\scripts\\pip.exe install requests
                    '''
                echo 'python and dependencies installed'
                echo 'running python script'
                bat 'C:\\python38\\python.exe -m computerMetricCollector.__init__ -l False -t True -rid goavnL_1r'
                echo 'program finished'
            }
        }
        stage('Create and run executable') {
            steps {
                bat '''cd computerMetricCollector
                    C:\\python38\\scripts\\pyinstaller.exe --onefile --name ComputerMetricsCollector __init__.py
                    dist\\ComputerMetricsCollector.exe -l False -t True -rid goavnL_1r
                    '''
            }
        }
        stage('Run test cases') {
            steps {
                bat 'C:\\python38\\python.exe -m computerMetricCollector.test.__init__'
            }
        }
    }
}
