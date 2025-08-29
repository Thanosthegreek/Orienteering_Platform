package com.orienteering;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;

import javax.sql.DataSource;
import java.sql.ResultSet;

@SpringBootApplication
public class Application {

    public static void main(String[] args) {
        SpringApplication.run(Application.class, args);
    }

    @Bean
    CommandLineRunner dbProbe(DataSource dataSource) {
        return args -> {
            try (var conn = dataSource.getConnection();
                 var st = conn.createStatement();
                 ResultSet rs = st.executeQuery(
                         "select version(), current_database(), current_user"
                 )) {
                if (rs.next()) {
                    System.out.println("✅ JDBC OK -> DB=" + rs.getString(2)
                            + " | user=" + rs.getString(3));
                    System.out.println("PostgreSQL: " + rs.getString(1));
                }
            }
        };
    }
}
