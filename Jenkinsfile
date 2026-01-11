// Defines a pipeline block that contains the entire continuous delivery pipeline
pipeline {
    agent any  // Specifies that this pipeline can run on any available agent

    // Defines environment variables that are accessible within the pipeline
    environment {
        // Docker network name (containers can talk to each other via this network)
        NETWORK = 'admin'

        // Docker image/container name for your app
        IMAGE_NAME = 'admin-ui'

        // Jenkins workspace directory
        WS = "${WORKSPACE}"

        // Build profile (used by: npm run build:<PROFILE>)
        PROFILE = 'prod'

        // Node image version (make it easy to change later)
        NODE_VERSION = '22'
        NODE_IMAGE   = "node:${NODE_VERSION}-alpine"

        // Docker port mapping (host -> container)
        HOST_PORT      = '8889'
        CONTAINER_PORT = '80'
    }

    // Contains all the stages in this pipeline
    stages {
        stage('1.Environment') {
            steps {
                sh 'pwd && ls -alh'
                sh 'printenv'
                sh 'docker version'
                sh 'git --version'
            }
        }

        stage('2.Compile') {
            agent {
                docker {
                    // Use a Docker agent with the specified Node image
                    image "${NODE_IMAGE}"
                }
            }
            steps {
                sh 'pwd && ls -alh'
                sh 'node -v'
                sh 'cd ${WS} && npm install --registry=https://registry.npmmirror.com --no-fund && npm run build:${PROFILE}'
            }
        }

        stage('3.Build') {
            steps {
                sh 'pwd && ls -alh'
                // Build Docker image using the Dockerfile in the current directory
                sh 'docker build -t ${IMAGE_NAME} .'
            }
        }

        stage('4.Deploy') {
            steps {
                sh 'pwd && ls -alh'

                // Cleanup old containers and dangling images to prevent conflicts and save space
                sh 'docker rm -f ${IMAGE_NAME} || true && docker rmi $(docker images -q -f dangling=true) || true'

                // Create the Docker network if it does not exist (idempotent)
                sh """
                docker network inspect ${NETWORK} >/dev/null 2>&1 || docker network create ${NETWORK}
                """

                sh """
                    docker run -d --net ${NETWORK} -p ${HOST_PORT}:${CONTAINER_PORT} \\
                      --name ${IMAGE_NAME} \\
                      --restart always \\
                      ${IMAGE_NAME}
                   """
            }
        }
    }
}
